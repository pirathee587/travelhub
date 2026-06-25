package com.travelhub.backend.converter;

import com.travelhub.backend.enums.District;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DistrictConverter implements AttributeConverter<District, String> {

    @Override
    public String convertToDatabaseColumn(District district) {
        if (district == null) {
            return null;
        }
        return district.getDisplayName();
    }

    @Override
    public District convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        return District.fromString(dbData);
    }
}
