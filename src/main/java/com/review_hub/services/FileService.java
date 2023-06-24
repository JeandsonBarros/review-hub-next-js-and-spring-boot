package com.review_hub.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileService {

    /* https://www.bezkoder.com/spring-boot-file-upload/ */

    public String save(MultipartFile file, String destinationFolder) throws IOException {

        Path path = Paths.get("uploads/" + destinationFolder);

        /* It creates the folder, and if the folder already exists nothing happens */
        Files.createDirectories(path);

        String fileName = file.getOriginalFilename();
        int newNumber = 1;

        /* Checks if file already exists, if it exists a new name is generated */
        while (true) {
            File fileExists = new File(path.toString() + "/" + newNumber + fileName);
            if (fileExists.exists() && !fileExists.isDirectory()) {
                newNumber++;
            } else {
                break;
            }
        }
        fileName = newNumber + fileName;

        /* Save image */
        Files.copy(file.getInputStream(), path.resolve(fileName));

        return fileName;
    }

    public byte[] load(String directory) throws IOException {

        Path path = Paths.get(directory);
        if (Files.exists(path)) {
            return Files.readAllBytes(path);
        }
        return null;
    }

    public String delete(String directory) throws IOException {

        Path path = Paths.get(directory);
        if (Files.exists(path)) {
            Files.delete(path);
            return "File deleted";
        }

        return "File not found";

    }

}
