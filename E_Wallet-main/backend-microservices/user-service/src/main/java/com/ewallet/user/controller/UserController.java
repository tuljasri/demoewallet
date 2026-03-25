package com.ewallet.user.controller;

import com.ewallet.user.model.User;
import com.ewallet.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        System.out.println("Creating user: " + user.getUsername());
        user.setPasskey(passwordEncoder.encode(user.getPasskey()));
        user.setBalance(0.0);
        userRepository.save(user);
        return "User Registered";
    }

    @GetMapping("/internal/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username);
    }

    @PutMapping("/internal/update")
    public User updateUser(@RequestBody User user) {
        return userRepository.save(user);
    }
}
