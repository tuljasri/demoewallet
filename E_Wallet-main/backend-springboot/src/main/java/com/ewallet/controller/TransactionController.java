package com.ewallet.controller;

import com.ewallet.model.Transaction;
import com.ewallet.repository.TransactionRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.ewallet.model.User;
import com.ewallet.repository.UserRepository;

@RestController
@RequestMapping("/transactions")
// @CrossOrigin removed - using global Spring Security CORS
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionController(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // ✅ GET ALL TRANSACTIONS FOR USER (SECURE)
    @GetMapping
    public List<Transaction> getTransactions(org.springframework.security.core.Authentication auth) {
        User loggedInUser = userRepository.findByUsername(auth.getName());
        return transactionRepository.findBySenderOrReceiver(loggedInUser.getId(), loggedInUser.getId());
    }
}