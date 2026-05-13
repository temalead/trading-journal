package com.nikulin.tradingjournalcore.application.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DealImageStorageService {

    @Value("${storage.s3.endpoint}")
    private String endpoint;
    @Value("${storage.s3.public-base-url}")
    private String publicBaseUrl;
    @Value("${storage.s3.access-key}")
    private String accessKey;
    @Value("${storage.s3.secret-key}")
    private String secretKey;
    @Value("${storage.s3.bucket}")
    private String bucket;

    private MinioClient minioClient;

    @PostConstruct
    void init() {
        minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
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

        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(image.getInputStream(), image.getSize(), -1)
                            .contentType(image.getContentType())
                            .build()
            );
            return publicBaseUrl.replaceAll("/$", "") + "/" + bucket + "/" + objectName;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to upload deal image", exception);
        }
    }

    private void ensureBucket() {
        try {
            var exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucket)
                            .config(publicReadPolicy())
                            .build()
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to initialize image bucket", exception);
        }
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
