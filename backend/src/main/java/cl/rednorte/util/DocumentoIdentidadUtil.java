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
            // El portal valida el N de serie sin guardar el valor en texto
            // plano. Para el MVP se usa SHA-256 deterministico.
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(normalizar(numeroSerie).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No fue posible validar el documento de identidad", exception);
        }
    }

    private static String normalizar(String value) {
        // Permite que el usuario ingrese el numero con puntos, guiones o
        // espacios sin romper la comparacion con el hash almacenado.
        return value == null
                ? ""
                : value.replace(".", "")
                        .replace("-", "")
                        .replace(" ", "")
                        .trim()
                        .toUpperCase(Locale.ROOT);
    }
}
