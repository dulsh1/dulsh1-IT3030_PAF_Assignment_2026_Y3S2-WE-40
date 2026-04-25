package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    /**
     * Generates a secure reset token for the user and sets a 15-minute expiry.
     * Returns the token so it can be emailed to the user.
     * If no user exists for the email, silently does nothing (security: don't reveal existence).
     */
    public Optional<String> generateResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        // OAuth-only users (no password) cannot reset via email
        if (user.getPassword() == null) return Optional.empty();

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return Optional.of(token);
    }

    /**
     * Validates the reset token and updates the password if valid.
     * Clears the token after use so it cannot be reused.
     */
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            // Clear the expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("Reset link has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
<<<<<<< Updated upstream
=======

    public User updateName(Long userId, String newName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(newName);
        return userRepository.save(user);
    }

    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If user already has a password, verify the old one
        if (user.getPassword() != null) {
            if (oldPassword == null || !passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new RuntimeException("Incorrect current password");
            }
        }

        // If it's a new password for OAuth user, or verified password for standard user
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
>>>>>>> Stashed changes
}