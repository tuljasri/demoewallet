package com.ewallet.auth.dto;

public class UserDto {
    private Long id;
    private String username;
    private String passkey;
    private boolean mfaEnabled;
    private String mfaSecret;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasskey() { return passkey; }
    public void setPasskey(String passkey) { this.passkey = passkey; }

    public boolean isMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }

    public String getMfaSecret() { return mfaSecret; }
    public void setMfaSecret(String mfaSecret) { this.mfaSecret = mfaSecret; }
}
