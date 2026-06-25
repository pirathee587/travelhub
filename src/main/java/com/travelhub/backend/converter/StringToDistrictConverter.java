package com.travelhub.backend.converter;

import com.travelhub.backend.enums.District;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

/**
 * Allows Spring MVC to convert a plain String (from multipart/form-data or
 * query params) into a {@link District} enum using the same case-insensitive
 * display-name logic that Jackson uses via {@code @JsonCreator}.
 */
@Component
public class StringToDistrictConverter implements Converter<String, District> {

    @Override
    public District convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        return District.fromString(source.trim());
    }
}
