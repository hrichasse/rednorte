package cl.rednorte.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoPaciente {
    EN_ESPERA("En espera"),
    CITADO("Citado"),
    URGENTE("Urgente"),
    ATENDIDO("Atendido");

    private final String value;

    EstadoPaciente(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static EstadoPaciente fromValue(String value) {
        for (EstadoPaciente estado : values()) {
            if (estado.value.equalsIgnoreCase(value)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de paciente no valido: " + value);
    }
}
