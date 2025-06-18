
const express = require('express');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configurações de caminho
const DATA_DIR = path.join(require('os').homedir(), 'Documents', 'Sistema-Comercial');
const EXCEL_FILE = path.join(DATA_DIR, 'sistema-comercial.xlsx');
const BACKUP_DIR = path.join(DATA_DIR, 'Backups');

// Estrutura padrão das planilhas
const SHEETS_STRUCTURE = {
  clientes: ['id', 'nome', 'telefone', 'endereco', 'data_cadastro'],
  produtos: ['id', 'nome', 'custo_producao', 'preco_sugerido', 'margem_lucro', 'percentual_lucro', 'estoque_atual', 'estoque_minimo', 'total_vendido', 'total_faturado'],
  pedidos: ['id', 'cliente_id', 'data_pedido', 'valor_total', 'valor_lucro', 'status'],
  itens_pedido: ['id', 'pedido_id', 'produto_id', 'quantidade', 'preco_unitario', 'custo_unitario', 'lucro_item'],
  fiados: ['id', 'cliente_id', 'data_fiado', 'descricao', 'valor_total', 'valor_pago', 'valor_pendente'],
  pagamentos_fiado: ['id', 'fiado_id', 'data_pagamento', 'valor_pagamento'],
  despesas_entradas: ['id', 'tipo', 'categoria', 'descricao', 'valor', 'data'],
  comodatos: ['id', 'cliente_id', 'produto', 'quantidade', 'quantidade_vendida', 'quantidade_paga', 'quantidade_pendente', 'valor_unitario', 'valor_total', 'valor_garantia', 'data_comodato', 'observacoes'],
  eventos: ['id', 'titulo', 'descricao', 'data_evento', 'hora_evento', 'valor', 'status', 'data_criacao']
};

// Função para garantir que os diretórios existam
function ensureDirectories() {
  try {
    fs.ensureDirSync(DATA_DIR);
    fs.ensureDirSync(BACKUP_DIR);
    console.log('✅ Diretórios criados/verificados:', DATA_DIR);
  } catch (error) {
    console.error('❌ Erro ao criar diretórios:', error);
  }
}

// Função para criar arquivo Excel inicial
function createInitialExcel() {
  try {
    const workbook = XLSX.utils.book_new();
    
    Object.keys(SHEETS_STRUCTURE).forEach(sheetName => {
      const headers = SHEETS_STRUCTURE[sheetName];
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    XLSX.writeFile(workbook, EXCEL_FILE);
    console.log('✅ Arquivo Excel inicial criado:', EXCEL_FILE);
  } catch (error) {
    console.error('❌ Erro ao criar arquivo Excel:', error);
  }
}

// Função para ler dados de uma planilha
function readSheet(sheetName) {
  try {
    if (!fs.existsSync(EXCEL_FILE)) {
      console.log('📄 Arquivo Excel não existe, criando...');
      createInitialExcel();
      return [];
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    
    if (!workbook.SheetNames.includes(sheetName)) {
      console.log(`📄 Planilha ${sheetName} não existe, retornando array vazio`);
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data;
  } catch (error) {
    console.error(`❌ Erro ao ler planilha ${sheetName}:`, error);
    return [];
  }
}

// Função para escrever dados em uma planilha
function writeSheet(sheetName, data) {
  try {
    let workbook;
    
    if (fs.existsSync(EXCEL_FILE)) {
      workbook = XLSX.readFile(EXCEL_FILE);
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Adicionar cabeçalhos se os dados não estiverem vazios
    let dataWithHeaders = data;
    if (data.length > 0) {
      const headers = SHEETS_STRUCTURE[sheetName];
      if (headers) {
        dataWithHeaders = [headers, ...data.map(row => headers.map(col => row[col] || ''))];
      }
    }

    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
    
    // Remover planilha existente se houver
    if (workbook.SheetNames.includes(sheetName)) {
      delete workbook.Sheets[sheetName];
      workbook.SheetNames = workbook.SheetNames.filter(name => name !== sheetName);
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, EXCEL_FILE);
    
    console.log(`✅ Dados salvos na planilha ${sheetName}:`, data.length, 'registros');
    return true;
  } catch (error) {
    console.error(`❌ Erro ao escrever planilha ${sheetName}:`, error);
    return false;
  }
}

// Função para criar backup
function createBackup() {
  try {
    if (!fs.existsSync(EXCEL_FILE)) return false;
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.xlsx`);
    
    fs.copySync(EXCEL_FILE, backupFile);
    console.log('✅ Backup criado:', backupFile);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    return false;
  }
}

// Rotas da API
app.get('/api/data/:sheet', (req, res) => {
  try {
    const { sheet } = req.params;
    const data = readSheet(sheet);
    res.json(data);
  } catch (error) {
    console.error('❌ Erro na rota GET:', error);
    res.status(500).json({ error: 'Erro ao ler dados' });
  }
});

app.post('/api/data/:sheet', (req, res) => {
  try {
    const { sheet } = req.params;
    const data = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Dados devem ser um array' });
    }
    
    const success = writeSheet(sheet, data);
    
    if (success) {
      res.json({ success: true, message: 'Dados salvos com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao salvar dados' });
    }
  } catch (error) {
    console.error('❌ Erro na rota POST:', error);
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
});

app.post('/api/initialize', (req, res) => {
  try {
    ensureDirectories();
    if (!fs.existsSync(EXCEL_FILE)) {
      createInitialExcel();
    }
    res.json({ success: true, message: 'Sistema inicializado' });
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
    res.status(500).json({ error: 'Erro ao inicializar sistema' });
  }
});

app.post('/api/seed', (req, res) => {
  try {
    // Dados iniciais de exemplo
    const seedData = {
      clientes: [{
        id: 'cliente_1',
        nome: 'Cliente Exemplo',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Exemplo, 123',
        data_cadastro: new Date().toISOString().split('T')[0]
      }],
      produtos: [{
        id: 'produto_1',
        nome: 'Produto Exemplo',
        custo_producao: 10.00,
        preco_sugerido: 20.00,
        margem_lucro: 10.00,
        percentual_lucro: 100.00,
        estoque_atual: 50,
        estoque_minimo: 10,
        total_vendido: 0,
        total_faturado: 0
      }],
      despesas_entradas: [{
        id: 'entrada_1',
        tipo: 'Entradas',
        categoria: 'Capital Inicial',
        descricao: 'Capital inicial do sistema',
        valor: 1000.00,
        data: new Date().toISOString().split('T')[0]
      }]
    };

    Object.entries(seedData).forEach(([sheet, data]) => {
      writeSheet(sheet, data);
    });

    res.json({ success: true, message: 'Dados iniciais aplicados' });
  } catch (error) {
    console.error('❌ Erro ao aplicar seed:', error);
    res.status(500).json({ error: 'Erro ao aplicar dados iniciais' });
  }
});

app.post('/api/export', (req, res) => {
  try {
    const success = createBackup();
    if (success) {
      res.json({ success: true, message: 'Backup criado com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao criar backup' });
    }
  } catch (error) {
    console.error('❌ Erro no export:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

app.get('/api/verify', (req, res) => {
  try {
    const valid = fs.existsSync(EXCEL_FILE);
    res.json({ valid, path: EXCEL_FILE });
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(500).json({ error: 'Erro ao verificar integridade' });
  }
});

// Inicializar servidor
function startServer() {
  ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`🚀 API Excel rodando na porta ${PORT}`);
    console.log(`📁 Arquivo de dados: ${EXCEL_FILE}`);
    console.log(`📁 Diretório de backups: ${BACKUP_DIR}`);
  });
}

// Iniciar servidor se executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = app;
