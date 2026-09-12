package com.telusko.pgbooking.Repo;

import com.telusko.pgbooking.Model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Long> {
}
