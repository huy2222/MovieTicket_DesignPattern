package org.example.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.backend.config.VNPayConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.url}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    @Value("${vnpay.version}")
    private String vnp_Version;

    @Value("${vnpay.command}")
    private String vnp_Command;

    public String createPaymentUrl(HttpServletRequest request, long amount, String orderInfo, String txnRef, String returnUrl) {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY expects amount in VND * 100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        TimeZone vnpayTimeZone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        Calendar cld = Calendar.getInstance(vnpayTimeZone);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(vnpayTimeZone);
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sort parameters alphabetically
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        // Build hashData (RAW values) and query (URL-encoded values)
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                try {
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());
                    String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString());
                    
                    // hashData uses raw key and URL-encoded value
                    if (hashData.length() > 0) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(encodedFieldValue);

                    // query uses URL-encoded key and URL-encoded value
                    if (query.length() > 0) {
                        query.append('&');
                    }
                    query.append(encodedFieldName);
                    query.append('=');
                    query.append(encodedFieldValue);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnp_PayUrl + "?" + queryUrl;
    }

    public boolean verifyPayment(Map<String, String> requestParams) {
        String vnp_SecureHash = requestParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            return false;
        }

        // Remove hash-related fields before computing
        Map<String, String> params = new HashMap<>(requestParams);
        params.remove("vnp_SecureHashType");
        params.remove("vnp_SecureHash");

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                try {
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());
                    if (hashData.length() > 0) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(encodedFieldValue);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String signValue = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
        return signValue.equals(vnp_SecureHash);
    }
}
