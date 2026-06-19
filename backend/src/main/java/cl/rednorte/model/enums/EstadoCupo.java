package cl.rednorte.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoCupo {
    DISPONIBLE("Disponible"),
    OCUPADO("Ocupado"),
    CANCELADO("Cancelado");

    private final String value;

    EstadoCupo(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static EstadoCupo fromValue(String value) {
        for (EstadoCupo estado : values()) {
            if (estado.value.equalsIgnoreCase(value)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de cupo no valido: " + value);
    }
}
