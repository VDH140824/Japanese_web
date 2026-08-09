package com.japaneselearning.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.japaneselearning.dto.response.CloudinaryUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;

@Service
public class CloudinaryService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:video_entertainment}")
    private String folder;

    public CloudinaryService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newBuilder().build();
        this.objectMapper = objectMapper;
    }

    public CloudinaryUploadResponse uploadVideo(MultipartFile file) {
        validateConfig();
        try {
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String signature = generateSignature(Map.of(
                    "folder", folder,
                    "resource_type", "video",
                    "timestamp", timestamp
            ));

            String boundary = "----VideoUploadBoundary" + System.currentTimeMillis();
            byte[] body = buildMultipartBody(boundary, file, timestamp, signature);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/video/upload"))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Cloudinary upload failed: " + response.body());
            }

            JsonNode json = objectMapper.readTree(response.body());
            String secureUrl = json.path("secure_url").asText(null);
            String publicId = json.path("public_id").asText(null);
            String thumbnailUrl = json.path("thumbnail_url").asText(null);
            if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
                thumbnailUrl = json.path("eager").isArray() && json.path("eager").size() > 0
                        ? json.path("eager").get(0).path("secure_url").asText(null)
                        : null;
            }

            return new CloudinaryUploadResponse(secureUrl, publicId, thumbnailUrl);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to upload video to Cloudinary", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Cloudinary upload interrupted", e);
        }
    }

    public void deleteVideo(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        validateConfig();
        try {
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String signature = generateSignature(Map.of(
                    "public_id", publicId,
                    "resource_type", "video",
                    "timestamp", timestamp
            ));

            String form = "public_id=" + urlEncode(publicId)
                    + "&resource_type=video"
                    + "&timestamp=" + timestamp
                    + "&api_key=" + urlEncode(apiKey)
                    + "&signature=" + urlEncode(signature);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/video/destroy"))
                    .header("Content-Type", MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Cloudinary delete failed: " + response.body());
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to delete video from Cloudinary", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Cloudinary delete interrupted", e);
        }
    }

    private void validateConfig() {
        if (cloudName == null || cloudName.isBlank()
                || apiKey == null || apiKey.isBlank()
                || apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary configuration is missing");
        }
    }

    private byte[] buildMultipartBody(String boundary, MultipartFile file, String timestamp, String signature) throws IOException {
        StringBuilder builder = new StringBuilder();
        appendFormField(builder, boundary, "file", file.getOriginalFilename(), file.getContentType(), file.getBytes());
        appendTextField(builder, boundary, "api_key", apiKey);
        appendTextField(builder, boundary, "timestamp", timestamp);
        appendTextField(builder, boundary, "folder", folder);
        appendTextField(builder, boundary, "resource_type", "video");
        appendTextField(builder, boundary, "signature", signature);
        builder.append("--").append(boundary).append("--").append("\r\n");
        return builder.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private void appendTextField(StringBuilder builder, String boundary, String name, String value) {
        builder.append("--").append(boundary).append("\r\n");
        builder.append("Content-Disposition: form-data; name=\"").append(name).append("\"").append("\r\n\r\n");
        builder.append(value).append("\r\n");
    }

    private void appendFormField(StringBuilder builder, String boundary, String name, String filename, String contentType, byte[] bytes) {
        builder.append("--").append(boundary).append("\r\n");
        builder.append("Content-Disposition: form-data; name=\"").append(name).append("\"; filename=\"")
                .append(filename == null ? "video" : filename).append("\"").append("\r\n");
        builder.append("Content-Type: ").append(contentType == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : contentType)
                .append("\r\n\r\n");
        builder.append(new String(bytes, StandardCharsets.ISO_8859_1)).append("\r\n");
    }

    private String generateSignature(Map<String, String> params) {
        try {
            TreeMap<String, String> sorted = new TreeMap<>(params);
            StringBuilder base = new StringBuilder();
            sorted.forEach((key, value) -> {
                if (value != null && !value.isBlank()) {
                    if (base.length() > 0) {
                        base.append("&");
                    }
                    base.append(key).append("=").append(value);
                }
            });
            base.append(apiSecret);

            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(base.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to generate Cloudinary signature", e);
        }
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}