package com.review_hub.services;

import com.review_hub.dtos.ProductDTO;
import com.review_hub.models.Product;
import com.review_hub.repository.ProductRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.webjars.NotFoundException;

import java.io.IOException;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private FileService fileService;

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
        /*return new ResponseEntity<>("Error listing products", HttpStatus.INTERNAL_SERVER_ERROR);*/
    }

    public Product getProduct(Long id) {

        Optional<Product> product = productRepository.findById(id);
        if (!product.isPresent())
            throw new NotFoundException("Product not found");

        return product.get();

        /* return new ResponseEntity<>("Error getting product data " + id, HttpStatus.INTERNAL_SERVER_ERROR);*/

    }

    public Page<Product> findByNameContaining(String name, Pageable pageable) {
        return productRepository.findByNameContaining(name, pageable);
        /* return new ResponseEntity<>("Error finding product", HttpStatus.INTERNAL_SERVER_ERROR);*/
    }

    public Page<Product> findByNameContainingAndCategoryContaining(String name, String category, Pageable pageable) {
        return productRepository.findByNameContainingAndCategoryContaining(name, category, pageable);
        /*return new ResponseEntity<>("Error finding product", HttpStatus.INTERNAL_SERVER_ERROR);*/
    }

    public Page<Product> findByCategory(String category, Pageable pageable) {
        return productRepository.findByCategory(category, pageable);
        /* return new ResponseEntity<>("Error listing products", HttpStatus.INTERNAL_SERVER_ERROR);*/
    }

    public Product saveNewProduct(ProductDTO productDTO) {

        Product product = new Product();
        BeanUtils.copyProperties(productDTO, product);

        if (productDTO.getImg() != null) {
            try {
                String fileName = fileService.save(productDTO.getImg(), "img_products");
                product.setImgName(fileName);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving product image");
            }
        }

        if (productDTO.getDescription().length() <= 570) {
            product.setDescription(productDTO.getDescription());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The maximum number of characters in the description is 570, you informed " + productDTO.getDescription().length());
        }

        if (productDTO.getDescription().length() <= 570) {
            product.setDescription(productDTO.getDescription());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The maximum number of characters in the description is 570, you informed " + productDTO.getDescription().length());
        }

        return productRepository.save(product);

    }

    public Product updateProduct(ProductDTO productDTO, Long id) {

        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Could not find product id " + id);
        }

        Product product = productRepository.findById(id).get();

        if (productDTO.getName() != null && !productDTO.getName().isEmpty()) {
            product.setName(productDTO.getName());
        }
        if (productDTO.getCategory() != null && !productDTO.getCategory().isEmpty()) {
            product.setCategory(productDTO.getCategory());
        }
        if (productDTO.getDescription() != null && !productDTO.getDescription().isEmpty()) {
            if (productDTO.getDescription().length() <= 570) {
                product.setDescription(productDTO.getDescription());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The maximum number of characters in the description is 570, you informed " + productDTO.getDescription().length());
            }
        }
        if (productDTO.getPrice() != product.getPrice()) {
            product.setPrice(productDTO.getPrice());
        }
        if (productDTO.getImg() != null) {
            try {
                fileService.delete("uploads/img_products/" + product.getImgName());
                String fileName = fileService.save(productDTO.getImg(), "img_products");
                product.setImgName(fileName);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating product image");
            }
        }

        return productRepository.save(product);

    }

    public void deleteProduct(Long id) {

        Optional<Product> product = productRepository.findById(id);
        if (!product.isPresent()) {
            throw new NotFoundException("Could not find product id " + id);
        }

        if (product.get().getName() != null && !product.get().getName().isEmpty()) {
            try {
                fileService.delete("uploads/img_products/" + product.get().getImgName());
            } catch (IOException e) {
                e.printStackTrace();
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting product image");
            }
        }
        productRepository.deleteById(id);

    }
}
