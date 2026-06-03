package com.nikulin.tradingjournalcore.domain.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DealSessionConverter implements AttributeConverter<DealSession, String> {

    @Override
    public String convertToDatabaseColumn(DealSession attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public DealSession convertToEntityAttribute(String dbData) {
        return DealSession.fromValue(dbData);
    }
}
