package com.ewallet.controller;

import com.ewallet.model.BankAccount;
import com.ewallet.model.User;
import com.ewallet.repository.AccountRepository;
import com.ewallet.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/accounts")
// @CrossOrigin removed - defined globally in SecurityConfig
public class AccountController {

    @Autowired
    private AccountRepository repo;

    @Autowired
    private UserRepository userRepository;

    // GET accounts (SECURE)
    @GetMapping
    public List<BankAccount> getAccounts(org.springframework.security.core.Authentication auth) {
        User loggedInUser = userRepository.findByUsername(auth.getName());
        return repo.findByUserId(loggedInUser.getId());
    }

    // ADD account
    @PostMapping
    public BankAccount addAccount(@RequestBody BankAccount account, org.springframework.security.core.Authentication auth) {

        System.out.println("ADD ACCOUNT CONTROLLER HIT");

        // 🔐 SECURE FIX: Override whatever the frontend sent with the ACTUAL authenticated user's ID
        User loggedInUser = userRepository.findByUsername(auth.getName());
        account.setUserId(loggedInUser.getId());

        // 🔍 Debug incoming data
        System.out.println("Bank: " + account.getBankName());
        System.out.println("Card: " + account.getCardNumber());
        System.out.println("Holder: " + account.getAccountHolder());
        System.out.println("Balance: " + account.getBalance());
        System.out.println("Secure UserId: " + account.getUserId());

        try {
            return repo.save(account);
        } catch (Exception e) {
            e.printStackTrace(); // 🔥 shows real error
            throw e;
        }
    }
    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteAccount(@PathVariable("id") Long id) {
        try {
            repo.deleteById(id);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown", "type", e.getClass().getName()));
        }
    }
    @PutMapping("/{id}")
    public BankAccount updateAccount(@PathVariable("id") Long id, @RequestBody BankAccount updated) {

        BankAccount acc = repo.findById(id).orElseThrow();

        acc.setBankName(updated.getBankName());
        acc.setAccountHolder(updated.getAccountHolder());
        acc.setBalance(updated.getBalance());

        return repo.save(acc);
    }
}