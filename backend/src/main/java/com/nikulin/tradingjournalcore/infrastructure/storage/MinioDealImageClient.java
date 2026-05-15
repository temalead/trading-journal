package com.nikulin.tradingjournalcore.infrastructure.storage;

import com.nikulin.tradingjournalcore.application.service.storage.DealImageClient;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class MinioDealImageClient implements DealImageClient {
    private final MinioClient minioClient;

    public MinioDealImageClient(@Value("${storage.s3.endpoint}") String endpoint,
                                @Value("${storage.s3.access-key}") String accessKey,
                                @Value("${storage.s3.secret-key}") String secretKey) {
        minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    @Override
    public boolean bucketExists(String bucket) {
        try {
            return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to check image bucket", exception);
        }
    }

    @Override
    public void createBucket(String bucket) {
        try {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create image bucket", exception);
        }
    }

    @Override
    public void setPublicReadPolicy(String bucket, String policy) {
        try {
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucket)
                            .config(policy)
                            .build()
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to update image bucket policy", exception);
        }
    }

    @Override
    public void upload(String bucket, String objectName, MultipartFile image) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(image.getInputStream(), image.getSize(), -1)
                            .contentType(image.getContentType())
                            .build()
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to upload deal image", exception);
        }
    }
}
