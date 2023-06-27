package com.review_hub.controllers;

import com.review_hub.dtos.ProductDTO;
import com.review_hub.models.Product;
import com.review_hub.services.FileService;
import com.review_hub.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
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

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get products | Authority: Permit All")
    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(@PageableDefault(page = 0, size = 30, sort = "name") Pageable pageable, @RequestParam(required = false) String name, @RequestParam(required = false) String category) {

        if (name != null && category != null)
            return new ResponseEntity<>(productService.findByNameContainingAndCategoryContaining(name, category, pageable), HttpStatus.OK);
        else if (category != null)
            return new ResponseEntity<>(productService.findByCategory(category, pageable), HttpStatus.OK);
        else if (name != null)
            return new ResponseEntity<>(productService.findByNameContaining(name, pageable), HttpStatus.OK);

        return new ResponseEntity<>(productService.getAllProducts(pageable), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get product | Authority: Permit All")
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return new ResponseEntity<>(productService.getProduct(id), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "201")
    @Operation(summary = "Register product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE,})
    public ResponseEntity<Product> postProduct(@Valid @RequestBody ProductDTO productDTO) {
        return new ResponseEntity<>(productService.saveNewProduct(productDTO), HttpStatus.CREATED);
    }

    @ApiResponse(responseCode = "201")
    @Operation(
            summary = "Multipart form  data to register product | Authority: ADMIN, MASTER",
            description = "This method was created just file upload"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Product> postFormProduct(@Valid ProductDTO productDTO) {
        return new ResponseEntity<>(productService.saveNewProduct(productDTO), HttpStatus.CREATED);
    }

    @ApiResponse(responseCode = "200")
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

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Partially update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Product> putProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO) {
        return new ResponseEntity<>(productService.updateProduct(productDTO, id), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Partially update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> putFormProduct(@PathVariable Long id, @Valid ProductDTO productDTO) {
        return new ResponseEntity<>(productService.updateProduct(productDTO, id), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Fully update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Product> pathProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        return new ResponseEntity<>(productService.updateProduct(productDTO, id), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Fully update product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> pathProductForm(@PathVariable Long id, @Valid ProductDTO productDTO, BindingResult result) {
        return new ResponseEntity<>(productService.updateProduct(productDTO, id), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "204")
    @Operation(summary = "Delete product | Authority: ADMIN, MASTER")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
