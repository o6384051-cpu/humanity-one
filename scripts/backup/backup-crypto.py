#!/usr/bin/env python3
"""Authenticated HUMANITY ONE backup encryption using Scrypt + AES-256-GCM."""
import os, sys
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt

MAGIC = b"HO1BKP1"
N, R, P = 2**18, 8, 1

def key_from_pin(pin: str, salt: bytes) -> bytes:
    if not pin.isascii() or not pin.isdigit() or len(pin) < 12:
        raise SystemExit("BACKUP_ENCRYPTION_PIN must be at least 12 digits.")
    return Scrypt(salt=salt, length=32, n=N, r=R, p=P).derive(pin.encode("utf-8"))

def main():
    if len(sys.argv) != 4 or sys.argv[1] not in {"encrypt", "decrypt"}:
        raise SystemExit("Usage: backup-crypto.py encrypt|decrypt INPUT OUTPUT")
    mode, source, target = sys.argv[1:]
    pin = os.environ.get("BACKUP_ENCRYPTION_PIN", "")
    if not pin:
        raise SystemExit("Required secret BACKUP_ENCRYPTION_PIN is not set.")
    data = Path(source).read_bytes()
    if mode == "encrypt":
        salt, nonce = os.urandom(16), os.urandom(12)
        key = key_from_pin(pin, salt)
        result = MAGIC + salt + nonce + AESGCM(key).encrypt(nonce, data, MAGIC)
    else:
        if len(data) < len(MAGIC) + 28 or not data.startswith(MAGIC):
            raise SystemExit("Invalid or unsupported encrypted backup format.")
        offset = len(MAGIC)
        salt, nonce, ciphertext = data[offset:offset+16], data[offset+16:offset+28], data[offset+28:]
        key = key_from_pin(pin, salt)
        try:
            result = AESGCM(key).decrypt(nonce, ciphertext, MAGIC)
        except Exception:
            raise SystemExit("Authentication failed: wrong PIN or damaged backup.")
    Path(target).write_bytes(result)
    os.chmod(target, 0o600)

if __name__ == "__main__":
    main()
