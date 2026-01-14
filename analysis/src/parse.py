import os
import scrapy

def extrair_transacao(transacao_selector, referencia):
    data = transacao_selector.css('dtposted::text').extract_first()
    descricao = transacao_selector.css('memo::text').extract_first()
    taxa = transacao_selector.css('currate::text').extract_first()
    valor = transacao_selector.css('trnamt::text').extract_first()
    return {'date': data[0:4]+'-'+data[4:6]+'-'+data[6:8],
            'descricao': descricao,
            'valor': valor if taxa is None else round(float(valor)*float(taxa), ndigits=2),
            'referencia': referencia}

def parse_xml(path):
    ofx = open(path)
    text = ofx.readlines()
    text = ''.join(text)
    selector = scrapy.selector.Selector(text=text)
    transacoes = selector.css('stmttrn')
    referencia = selector.css('dtasof::text').extract_first()
    referencia = referencia[0:4]+'-'+referencia[4:6]+'-'+referencia[6:8] if referencia else None
    return [extrair_transacao(transacao, referencia) for transacao in transacoes]

lista = []

pathCartao = '../../dados/cartao/'
pathConta = '../../dados/conta/'

filesCartao = [file for file in os.listdir(pathCartao) if '2025' in file]
filesCartao.sort()
filesCartao

filesCartao = [file for file in os.listdir(pathCartao) if '19' in file or '20' in file]
filesCartao.sort()
filesCartao

for file in filesCartao:
    lista.extend(parse_xml(pathCartao+file))

import json
with open('../../dados/tudo.json', 'w') as fout:
    json.dump(lista , fout, indent=4)