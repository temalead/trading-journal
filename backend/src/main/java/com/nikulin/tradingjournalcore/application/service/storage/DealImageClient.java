package com.nikulin.tradingjournalcore.application.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface DealImageClient {
    boolean bucketExists(String bucket);

    void createBucket(String bucket);

    void setPublicReadPolicy(String bucket, String policy);

    void upload(String bucket, String objectName, MultipartFile image);
}
