package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.application.service.storage.DealImageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@Service
public class DealImageStorageService {

    private final DealImageClient dealImageClient;
    private final String publicBaseUrl;
    private final String bucket;

    public DealImageStorageService(DealImageClient dealImageClient,
                                   @Value("${storage.s3.public-base-url}") String publicBaseUrl,
                                   @Value("${storage.s3.bucket}") String bucket) {
        this.dealImageClient = dealImageClient;
        this.publicBaseUrl = publicBaseUrl;
        this.bucket = bucket;
    }

    public String uploadDealImage(String userId, String dealId, MultipartFile image) {
        validate(image);
        ensureBucket();

        var objectName = "users/%s/deals/%s/%s%s".formatted(
                userId,
                dealId,
                UUID.randomUUID(),
                extension(image.getOriginalFilename())
        );

        dealImageClient.upload(bucket, objectName, image);
        return publicBaseUrl.replaceAll("/$", "") + "/" + bucket + "/" + objectName;
    }

    private void ensureBucket() {
        if (!dealImageClient.bucketExists(bucket)) {
            dealImageClient.createBucket(bucket);
        }
        dealImageClient.setPublicReadPolicy(bucket, publicReadPolicy());
    }

    private String publicReadPolicy() {
        return """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": "*",
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket);
    }

    private void validate(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are supported");
        }
    }

    private String extension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        var extension = filename.substring(filename.lastIndexOf(".")).toLowerCase(Locale.ROOT);
        return extension.matches("\\.[a-z0-9]{1,8}") ? extension : "";
    }
}
