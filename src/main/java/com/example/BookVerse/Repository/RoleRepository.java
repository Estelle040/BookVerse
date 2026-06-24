package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleIgnoreCase(String name);
}
