package com.review_hub.controllers;

import com.review_hub.dtos.ProductDTO;
import com.review_hub.services.FileService;
import com.review_hub.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/product/")
@Tag(name = "Product")
public class ProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private FileService fileService;

    @Operation(summary = "Get products | Authority: Permit All")
    @GetMapping
    public ResponseEntity<Object> getProducts(@PageableDefault(page = 0, size = 30, sort = "name") Pageable pageable, @RequestParam(required = false) String name, @RequestParam(required = false) String category) {

        if (name != null && category != null)
            return productService.findByNameContainingAndCategoryContaining(name, category, pageable);
        else if (category != null)
            return productService.findByCategory(category, pageable);
        else if (name != null)
            return productService.findByNameContaining(name, pageable);

        return productService.getAllProducts(pageable);
    }

    @Operation(summary = "Get product | Authority: Permit All")
    @GetMapping("/{id}")
    public ResponseEntity<Object> getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @Operation(summary = "Register product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE,})
    public ResponseEntity<Object> postProduct(@Valid @RequestBody ProductDTO productDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return productService.saveNewProduct(productDTO);
    }

    @Operation(
            summary = "Multipart form  data to register product | Authority: ADMIN, MASTER",
            description = "This method was created just file upload"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Object> postFormProduct(@Valid ProductDTO productDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return productService.saveNewProduct(productDTO);
    }

    @GetMapping(value = "/get-img/{fileName}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<Object> getFile(@PathVariable String fileName) {
        try {
            var img = fileService.load("uploads/img_products/" + fileName);
            if (img != null)
                return new ResponseEntity<>(img, HttpStatus.OK);
            else
                return new ResponseEntity<>("Image not found", HttpStatus.NOT_FOUND);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error loading image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Partially update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> putProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return productService.updateProduct(productDTO, id);
    }

    @Operation(summary = "Partially update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> putFormProduct(@PathVariable Long id, @Valid ProductDTO productDTO, BindingResult result) {

        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return productService.updateProduct(productDTO, id);
    }

    @Operation(summary = "Fully update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> pathProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {

        return productService.updateProduct(productDTO, id);
    }

    @Operation(summary = "Fully update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> pathProductForm(@PathVariable Long id,@Valid ProductDTO productDTO, BindingResult result) {
        return productService.updateProduct(productDTO, id);
    }

    @Operation(summary = "Delete product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }

}
