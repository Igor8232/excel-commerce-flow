
-- Create clientes table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf_cnpj TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  nome_fantasia TEXT,
  observacao TEXT,
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create produtos table
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  custo_producao DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_sugerido DECIMAL(10,2) NOT NULL DEFAULT 0,
  margem_lucro DECIMAL(10,2) NOT NULL DEFAULT 0,
  percentual_lucro DECIMAL(5,2) NOT NULL DEFAULT 0,
  estoque_atual INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 0,
  total_vendido INTEGER NOT NULL DEFAULT 0,
  total_faturado DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedidos table
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_lucro DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'producao', 'pronto', 'entregue')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itens_pedido table
CREATE TABLE public.itens_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  custo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  lucro_item DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fiados table
CREATE TABLE public.fiados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_pendente DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_vencimento DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pagamentos_fiado table
CREATE TABLE public.pagamentos_fiado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fiado_id UUID NOT NULL REFERENCES public.fiados(id) ON DELETE CASCADE,
  valor_pagamento DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create despesas_entradas table
CREATE TABLE public.despesas_entradas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('Despesas', 'Entradas', 'Bônus')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comodatos table
CREATE TABLE public.comodatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_vendida INTEGER NOT NULL DEFAULT 0,
  quantidade_paga INTEGER NOT NULL DEFAULT 0,
  quantidade_pendente INTEGER NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_garantia DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_comodato DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create eventos table
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento DATE NOT NULL,
  hora_evento TIME,
  valor DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Concluído', 'Cancelado')),
  tipo TEXT CHECK (tipo IN ('Reunião', 'Pagamento', 'Entrega', 'Evento', 'Lembrete', 'Outro')),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  observacoes TEXT,
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_pedidos_cliente_id ON public.pedidos(cliente_id);
CREATE INDEX idx_itens_pedido_pedido_id ON public.itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto_id ON public.itens_pedido(produto_id);
CREATE INDEX idx_fiados_cliente_id ON public.fiados(cliente_id);
CREATE INDEX idx_pagamentos_fiado_fiado_id ON public.pagamentos_fiado(fiado_id);
CREATE INDEX idx_comodatos_cliente_id ON public.comodatos(cliente_id);
CREATE INDEX idx_eventos_cliente_id ON public.eventos(cliente_id);
CREATE INDEX idx_eventos_data_evento ON public.eventos(data_evento);
