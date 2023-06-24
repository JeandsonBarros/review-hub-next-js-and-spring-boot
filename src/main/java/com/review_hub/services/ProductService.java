package com.review_hub.services;

import com.review_hub.dtos.ProductDTO;
import com.review_hub.models.Product;
import com.review_hub.repository.ProductRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private FileService fileService;

    public ResponseEntity<Object> getAllProducts(Pageable pageable) {
        try {
            return new ResponseEntity<>(productRepository.findAll(pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> getProduct(Long id) {
        try {
            Optional<Product> product = productRepository.findById(id);
            if (!product.isPresent())
                return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);

            return new ResponseEntity<>(product.get(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error getting product data " + id, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> findByNameContaining(String name, Pageable pageable) {
        try {
            return new ResponseEntity<>(productRepository.findByNameContaining(name, pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error finding product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> findByNameContainingAndCategoryContaining(String name, String category, Pageable pageable) {
        try {
            return new ResponseEntity<>(productRepository.findByNameContainingAndCategoryContaining(name, category, pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error finding product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> findByCategory(String category, Pageable pageable) {
        try {
            return new ResponseEntity<>(productRepository.findByCategory(category, pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> saveNewProduct(ProductDTO productDTO) {
        try {

            Product product = new Product();

            if (productDTO.getImg() != null) {
                String fileName = fileService.save(productDTO.getImg(), "img_products");
                product.setImgName(fileName);
            }

            BeanUtils.copyProperties(productDTO, product);
            if (productDTO.getDescription().length() <= 570) {
                product.setDescription(productDTO.getDescription());
            } else {
                return new ResponseEntity<>("The maximum number of characters in the description is 570, you informed " + productDTO.getDescription().length(), HttpStatus.BAD_REQUEST);
            }

            return new ResponseEntity<>(productRepository.save(product), HttpStatus.CREATED);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error saving product image", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error saving product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> updateProduct(ProductDTO productDTO, Long id) {
        try {

            if (!productRepository.existsById(id)) {
                return new ResponseEntity<>("Could not find product id " + id, HttpStatus.NOT_FOUND);
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
                    return new ResponseEntity<>("The maximum number of characters in the description is 570, you informed " + productDTO.getDescription().length(), HttpStatus.BAD_REQUEST);
                }
            }

            if (productDTO.getPrice() != product.getPrice()) {
                product.setPrice(productDTO.getPrice());
            }

            if (productDTO.getImg() != null) {
                fileService.delete("uploads/img_products/" + product.getImgName());
                String fileName = fileService.save(productDTO.getImg(), "img_products");
                product.setImgName(fileName);
            }

            return new ResponseEntity<>(productRepository.save(product), HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updated product image", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating product", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> deleteProduct(Long id) {
        try {

            Optional<Product> product = productRepository.findById(id);
            if (!product.isPresent())
                return new ResponseEntity<>("Could not find product id " + id, HttpStatus.NOT_FOUND);

            if (product.get().getName() != null && !product.get().getName().isEmpty())
                fileService.delete("uploads/img_products/" + product.get().getImgName());

            productRepository.deleteById(id);

            return new ResponseEntity<>("Product deleted", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing products", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
