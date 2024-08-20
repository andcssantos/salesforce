public with sharing class ViaCepController {

    private static final String BASE_URL = 'https://viacep.com.br/ws/';

    /**
     * Busca o endereço associado ao CEP fornecido.
     *
     * @param cep O CEP para consulta.
     * @return Um mapa contendo os dados do endereço.
     * @throws AuraHandledException Se o CEP for inválido, se não for possível encontrar o endereço, ou se ocorrer um erro ao processar a resposta.
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getAddressByCep(String cep) {
        try {
            validateCep(cep);
            HttpResponse response = makeHttpRequest(cep);
            Map<String, String> address = parseResponse(response);

            if (address == null || address.isEmpty() || address.get('logradouro') == null) {
                throw new AuraHandledException('Endereço não encontrado para o CEP informado.');
            }

            return address;
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao buscar o endereço: ' + e.getMessage());
        }
    }

    /**
     * Valida o CEP fornecido.
     *
     * @param cep O CEP a ser validado.
     * @throws AuraHandledException Se o CEP for em branco ou não for válido.
     */
    private static void validateCep(String cep) {
        if (String.isBlank(cep) || !isValidCep(cep)) {
            throw new AuraHandledException('CEP inválido.');
        }
    }

    /**
     * Verifica se o CEP possui o formato correto (8 dígitos).
     *
     * @param cep O CEP a ser verificado.
     * @return Verdadeiro se o CEP for válido, falso caso contrário.
     */
    private static Boolean isValidCep(String cep) {
        String cleanCep = cep.replaceAll('\\D', '');
        return cleanCep.length() == 8;
    }

    /**
     * Faz uma requisição HTTP para a API ViaCEP para obter os dados do endereço.
     *
     * @param cep O CEP para consulta.
     * @return A resposta HTTP da API.
     * @throws AuraHandledException Se a resposta HTTP não for bem-sucedida.
     */
    private static HttpResponse makeHttpRequest(String cep) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + cep + '/json/');
        req.setMethod('GET');

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 200) {
            throw new AuraHandledException('Endereço não encontrado');
        }

        return res;
    }

    /**
     * Processa a resposta da API e extrai os dados do endereço.
     *
     * @param response A resposta HTTP da API.
     * @return Um mapa contendo os dados do endereço.
     * @throws AuraHandledException Se ocorrer um erro ao processar a resposta.
     */
    private static Map<String, String> parseResponse(HttpResponse response) {
        try {
            String responseBody = response.getBody();
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(responseBody);

            Map<String, String> address = new Map<String, String>();
            address.put('logradouro', (String) result.get('logradouro'));
            address.put('bairro', (String) result.get('bairro'));
            address.put('localidade', (String) result.get('localidade'));
            address.put('uf', (String) result.get('uf'));
            address.put('ibge', (String) result.get('ibge'));
            address.put('gia', (String) result.get('gia'));
            address.put('ddd', (String) result.get('ddd'));
            address.put('siafi', (String) result.get('siafi'));

            return address;
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao processar a resposta: ' + e.getMessage());
        }
    }
}