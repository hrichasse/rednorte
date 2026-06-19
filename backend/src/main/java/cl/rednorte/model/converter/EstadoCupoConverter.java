package cl.rednorte.model.converter;

import cl.rednorte.model.enums.EstadoCupo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EstadoCupoConverter implements AttributeConverter<EstadoCupo, String> {

    @Override
    public String convertToDatabaseColumn(EstadoCupo attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public EstadoCupo convertToEntityAttribute(String dbData) {
        return dbData == null ? null : EstadoCupo.fromValue(dbData);
    }
}
