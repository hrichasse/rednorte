package cl.rednorte.model.converter;

import cl.rednorte.model.enums.EstadoPaciente;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EstadoPacienteConverter implements AttributeConverter<EstadoPaciente, String> {

    @Override
    public String convertToDatabaseColumn(EstadoPaciente attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public EstadoPaciente convertToEntityAttribute(String dbData) {
        return dbData == null ? null : EstadoPaciente.fromValue(dbData);
    }
}
