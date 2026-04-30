import binascii
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


def _get_key() -> bytes:
    return binascii.unhexlify(settings.api_key_encryption_secret)


def encrypt_api_key(plaintext: str) -> str:
    """평문 API Key → AES-256-GCM 암호화 후 hex 문자열 반환."""
    key = _get_key()
    nonce = os.urandom(12)  # 96-bit nonce
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return (nonce + ciphertext).hex()


def decrypt_api_key(encrypted_hex: str) -> str:
    """hex 문자열 → 복호화하여 평문 API Key 반환."""
    key = _get_key()
    data = binascii.unhexlify(encrypted_hex)
    nonce, ciphertext = data[:12], data[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None).decode()
