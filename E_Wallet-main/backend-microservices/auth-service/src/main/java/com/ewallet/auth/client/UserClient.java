package com.ewallet.auth.client;

import com.ewallet.auth.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/api/users/internal/{username}")
    UserDto getUserByUsername(@PathVariable("username") String username);

    @PutMapping("/api/users/internal/update")
    UserDto updateUser(@RequestBody UserDto user);
}
