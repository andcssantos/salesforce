public with sharing class AddressController {
    @AuraEnabled
    public static void saveAddress(Address__c addressData) {
        try {
            if (!Schema.sObjectType.Address__c.isCreateable()) {
                throw new AuraHandledException('Insufficient permissions to create Address__c records.');
            }

            Address__c newAddress = new Address__c(
                cep__c          = addressData.cep__c,
                logradouro__c   = addressData.logradouro__c,
                number__c       = addressData.number__c,
                Complemento__c  = addressData.Complemento__c,
                Bairro__c       = addressData.Bairro__c,
                Cidade__c       = addressData.Cidade__c,
                UF__c           = addressData.UF__c,
                Observacao__c   = addressData.Observacao__c
            );
            insert newAddress;
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao salvar endereço: ' + e.getMessage());
        }
    }
}
