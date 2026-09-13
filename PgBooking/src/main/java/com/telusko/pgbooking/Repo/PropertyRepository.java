package com.telusko.pgbooking.Repo;

import com.telusko.pgbooking.Model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwner_EmailIgnoreCase(String email);
}