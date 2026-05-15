package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.application.service.storage.DealImageClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DealImageStorageServiceTest {

    @Mock
    private DealImageClient dealImageClient;

    @Test
    void uploadDealImageCreatesBucketWhenMissingAndReturnsPublicUrl() {
        var service = new DealImageStorageService(dealImageClient, "http://localhost:9000/", "images");
        var image = new MockMultipartFile("images", "chart.PNG", "image/png", "data".getBytes());
        when(dealImageClient.bucketExists("images")).thenReturn(false);

        var url = service.uploadDealImage("user-1", "deal-1", image);

        var objectName = ArgumentCaptor.forClass(String.class);
        verify(dealImageClient).createBucket("images");
        verify(dealImageClient).setPublicReadPolicy(org.mockito.ArgumentMatchers.eq("images"), org.mockito.ArgumentMatchers.contains("arn:aws:s3:::images/*"));
        verify(dealImageClient).upload(org.mockito.ArgumentMatchers.eq("images"), objectName.capture(), org.mockito.ArgumentMatchers.same(image));
        assertThat(objectName.getValue()).startsWith("users/user-1/deals/deal-1/");
        assertThat(objectName.getValue()).endsWith(".png");
        assertThat(url).isEqualTo("http://localhost:9000/images/" + objectName.getValue());
    }

    @Test
    void uploadDealImageDoesNotCreateExistingBucket() {
        var service = new DealImageStorageService(dealImageClient, "http://localhost:9000", "images");
        var image = new MockMultipartFile("images", "chart.jpg", "image/jpeg", "data".getBytes());
        when(dealImageClient.bucketExists("images")).thenReturn(true);

        service.uploadDealImage("user-1", "deal-1", image);

        verify(dealImageClient, org.mockito.Mockito.never()).createBucket("images");
    }

    @Test
    void uploadDealImageRejectsNonImageFiles() {
        var service = new DealImageStorageService(dealImageClient, "http://localhost:9000", "images");
        var file = new MockMultipartFile("images", "notes.txt", "text/plain", "data".getBytes());

        assertThatThrownBy(() -> service.uploadDealImage("user-1", "deal-1", file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only image files are supported");
    }

    @Test
    void uploadDealImageRejectsEmptyFile() {
        var service = new DealImageStorageService(dealImageClient, "http://localhost:9000", "images");
        var file = new MockMultipartFile("images", "empty.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> service.uploadDealImage("user-1", "deal-1", file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Image file is required");
    }
}
