package cl.rednorte.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

public final class DocumentoIdentidadUtil {

    private DocumentoIdentidadUtil() {
    }

    public static String hashNumeroSerie(String numeroSerie) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalizar(numeroSerie).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No fue posible validar el documento de identidad", exception);
        }
    }

    private static String normalizar(String value) {
        return value == null
                ? ""
                : value.replace(".", "")
                        .replace("-", "")
                        .replace(" ", "")
                        .trim()
                        .toUpperCase(Locale.ROOT);
    }
}
