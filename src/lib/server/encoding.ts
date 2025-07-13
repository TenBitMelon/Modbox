import { encodeBase64, decodeBase64 } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export function encodeStringToBase64(str: string): string {
	return encodeBase64(new TextEncoder().encode(str));
}

export function decodeBase64ToString(base64: string): string {
	return uint8ArrayToHex(decodeBase64(base64.replaceAll('\n', '')));
}

export function hashString(str: string): string {
	return uint8ArrayToHex(sha256(new TextEncoder().encode(str)));
}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
	let hexString = '';
	for (let i = 0; i < uint8Array.length; i++) {
		const hex = uint8Array[i].toString(16);
		hexString += hex.padStart(2, '0');
	}
	return hexString;
}
