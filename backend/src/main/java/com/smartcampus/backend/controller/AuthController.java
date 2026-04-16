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
 * Member: Samantha (IT234576869) — Module E (Auth & User Management)
 *
 * Endpoints:
 *   GET    /api/auth/me                — Get currently authenticated user profile
 *   POST   /api/auth/register          — Register a new user with email/password
 *   POST   /api/auth/login             — Login with email/password, returns JWT
 *   GET    /api/auth/users             — Admin: list all registered users
 *   POST   /api/auth/users             — Admin: manually create a new user
 *   PUT    /api/auth/users/{id}/role   — Admin: update a user's role
 *   DELETE /api/auth/users/{id}        — Admin: remove a user account
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
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(404).body(Map.of("message", "User not found"));
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
                return ResponseEntity.badRequest().body(Map.of("message", "An account with this email already exists"));
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

            // Block OAuth-only users from using password login
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