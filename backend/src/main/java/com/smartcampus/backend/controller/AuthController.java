package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.security.JwtUtils;
import com.smartcampus.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Authentication & User Management REST Controller
 *
 * Endpoints:
 *   GET    /api/auth/me                    — Get currently authenticated user profile
 *   POST   /api/auth/register              — Register a new user with email/password
 *   POST   /api/auth/login                 — Login with email/password, returns JWT
 *   POST   /api/auth/forgot-password       — Send password reset email
 *   POST   /api/auth/reset-password        — Reset password using token from email
 *   GET    /api/auth/users                 — Admin: list all registered users
 *   POST   /api/auth/users                 — Admin: manually create a new user
 *   PUT    /api/auth/users/{id}/role       — Admin: update a user's role
 *   DELETE /api/auth/users/{id}            — Admin: remove a user account
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ── GET /api/auth/me ─────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        String email = authentication.getName();
        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole().name());
            response.put("hasPassword", user.getPassword() != null);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(Map.of("message", "User not found"));
    }

    @PostMapping("/update-name")
    public ResponseEntity<?> updateName(Authentication authentication, @RequestBody Map<String, String> payload) {
        try {
            if (authentication == null) return ResponseEntity.status(401).build();
            String email = authentication.getName();
            User user = userService.getUserByEmail(email).orElseThrow();
            
            String newName = payload.get("newName");
            if (newName == null || newName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
            }
            
            User updated = userService.updateName(user.getId(), newName);
            return ResponseEntity.ok(Map.of("name", updated.getName(), "message", "Name updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody Map<String, String> payload) {
        try {
            if (authentication == null) return ResponseEntity.status(401).build();
            String email = authentication.getName();
            User user = userService.getUserByEmail(email).orElseThrow();
            
            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");
            
            if (newPassword == null || newPassword.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters"));
            }
            
            userService.updatePassword(user.getId(), oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            String msg = e.getMessage();
            return ResponseEntity.status(msg.contains("password") ? 401 : 400).body(Map.of("message", msg));
        }
    }

    // ── POST /api/auth/register ──────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String email = payload.get("email");
            String password = payload.get("password");

            if (name == null || name.isBlank() || email == null || email.isBlank()
                    || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name, email and password are required"));
            }

            if (userService.getUserByEmail(email).isPresent()) {
                return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists"));
            }

            User newUser = new User(email, name, Role.ROLE_USER);
            newUser.setPassword(passwordEncoder.encode(password));
            User saved = userService.createUser(newUser);

            String token = jwtUtils.generateJwtToken(saved.getEmail(), saved.getRole().name());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/auth/login ─────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String password = payload.get("password");

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
            }

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
            }

            User user = userOpt.get();

            if (user.getPassword() == null) {
                return ResponseEntity.status(401).body(Map.of("message", "This account uses Google Sign-In. Please use the Google login button."));
            }

            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
            }

            String token = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/auth/forgot-password ───────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        // Generate token (silently does nothing if email not found — security best practice)
        Optional<String> tokenOpt = userService.generateResetToken(email.trim().toLowerCase());

        if (tokenOpt.isPresent()) {
            String resetToken = tokenOpt.get();
            String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

            // ── TODO: Replace this with your email service (e.g. JavaMailSender) ──
            // For now, we print the link to the console for testing
            System.out.println("=== PASSWORD RESET LINK (dev only) ===");
            System.out.println("Email: " + email);
            System.out.println("Link:  " + resetLink);
            System.out.println("======================================");
            // ────────────────────────────────────────────────────────────────────
        }

        // Always return 200 — never confirm whether email exists (security)
        return ResponseEntity.ok(Map.of("message", "If an account exists for this email, a reset link has been sent."));
    }

    // ── POST /api/auth/reset-password ────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        try {
            String token = payload.get("token");
            String newPassword = payload.get("newPassword");

            if (token == null || token.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Reset token is required"));
            }
            if (newPassword == null || newPassword.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters"));
            }

            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));

        } catch (RuntimeException e) {
            // Return 410 Gone for expired/invalid token so the frontend can show the right screen
            return ResponseEntity.status(410).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to reset password. Please try again."));
        }
    }

    // ── GET /api/auth/users ──────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ── POST /api/auth/users ─────────────────────────────────────────
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String email = payload.get("email");
            String roleStr = payload.get("role");
            String password = payload.get("password");

            if (name == null || name.isBlank() || email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name and email are required"));
            }
            if (userService.getUserByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "A user with this email already exists"));
            }

            Role role = (roleStr != null && !roleStr.isBlank()) ? Role.valueOf(roleStr) : Role.ROLE_USER;
            User newUser = new User(email, name, role);

            if (password != null && !password.isBlank()) {
                newUser.setPassword(passwordEncoder.encode(password));
            }

            User saved = userService.createUser(newUser);
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("name", saved.getName());
            response.put("email", saved.getEmail());
            response.put("role", saved.getRole().name());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Accepted: ROLE_USER, ROLE_ADMIN, ROLE_TECHNICIAN"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT /api/auth/users/{id}/role ────────────────────────────────
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        try {
            String roleStr = payload.get("role");
            if (roleStr == null || roleStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
            }
            Role newRole = Role.valueOf(roleStr);
            User updated = userService.updateRole(id, newRole);
            Map<String, Object> response = new HashMap<>();
            response.put("id", updated.getId());
            response.put("email", updated.getEmail());
            response.put("name", updated.getName());
            response.put("role", updated.getRole().name());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role value. Accepted: ROLE_USER, ROLE_ADMIN, ROLE_TECHNICIAN"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── DELETE /api/auth/users/{id} ──────────────────────────────────
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}