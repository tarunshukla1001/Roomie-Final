package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Model.User;
import com.telusko.pgbooking.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final   UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping
    public User createUser(@RequestBody User user){
        return userService.createUser(user);
    }
    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id){
        return userService.getUserById(id);
    }
    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return userService.updateUser(id, user);
    }
    @DeleteMapping("/{id}")
        public String deleteUser(@PathVariable Long id){
            userService.deleteUser(id);
            return "User deleted Successfully";
        }
    }

