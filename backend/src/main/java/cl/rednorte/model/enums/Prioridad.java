package cl.rednorte.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Prioridad {
    ALTA("ALTA"),
    MEDIA("MEDIA"),
    BAJA("BAJA");

    private final String value;

    Prioridad(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
