package com.evaluation.services;

import com.evaluation.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public ResponseEntity<Object> getAllProducts(){
        return new ResponseEntity<>("teste", HttpStatus.OK);
    }

    public ResponseEntity<Object> saveProduct(){
        return new ResponseEntity<>("teste", HttpStatus.OK);
    }

}
