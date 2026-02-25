package com.xyz.lastdemo.service;

import com.xyz.lastdemo.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * File Storage Service
 * Handles file uploads (profile pictures, attachments)
 */
@Service
@Slf4j
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    /**
     * Store file in specified directory
     */
    public String storeFile(MultipartFile file, String subDirectory) {
        // Validate file
        validateFile(file);

        // Normalize filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + fileExtension;

        try {
            // Create subdirectory if it doesn't exist
            Path targetLocation = fileStorageLocation.resolve(subDirectory);
            Files.createDirectories(targetLocation);

            // Copy file to target location
            Path destinationFile = targetLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}", newFilename);

            // Return relative path
            return "/" + subDirectory + "/" + newFilename;

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + newFilename, ex);
        }
    }

    /**
     * Delete file
     */
    public void deleteFile(String filePath) {
        try {
            Path file = fileStorageLocation.resolve(filePath.substring(1)).normalize();
            Files.deleteIfExists(file);
            log.info("File deleted: {}", filePath);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", filePath, ex);
        }
    }

    // Helper methods

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("Cannot store empty file");
        }

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (filename.contains("..")) {
            throw new FileStorageException("Invalid file path: " + filename);
        }

        // Validate file size (10MB max)
        long maxSize = 10 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new FileStorageException("File size exceeds maximum limit of 10MB");
        }

        // Validate file type for images
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("image/")) {
            if (!isValidImageType(contentType)) {
                throw new FileStorageException("Only JPG, JPEG, PNG and GIF images are allowed");
            }
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif");
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex);
    }
}