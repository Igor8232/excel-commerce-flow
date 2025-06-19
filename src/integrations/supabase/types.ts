export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          nome_fantasia: string | null
          observacao: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          nome_fantasia?: string | null
          observacao?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          nome_fantasia?: string | null
          observacao?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comodatos: {
        Row: {
          cliente_id: string
          created_at: string
          data_comodato: string
          id: string
          observacoes: string | null
          produto: string
          quantidade: number
          quantidade_paga: number
          quantidade_pendente: number
          quantidade_vendida: number
          updated_at: string
          valor_garantia: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_comodato?: string
          id?: string
          observacoes?: string | null
          produto: string
          quantidade?: number
          quantidade_paga?: number
          quantidade_pendente?: number
          quantidade_vendida?: number
          updated_at?: string
          valor_garantia?: number
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_comodato?: string
          id?: string
          observacoes?: string | null
          produto?: string
          quantidade?: number
          quantidade_paga?: number
          quantidade_pendente?: number
          quantidade_vendida?: number
          updated_at?: string
          valor_garantia?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "comodatos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_entradas: {
        Row: {
          categoria: string | null
          created_at: string
          data_registro: string
          descricao: string
          id: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_registro?: string
          descricao: string
          id?: string
          tipo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_registro?: string
          descricao?: string
          id?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      eventos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_criacao: string
          data_evento: string
          descricao: string | null
          hora_evento: string | null
          id: string
          observacoes: string | null
          status: string
          tipo: string | null
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_criacao?: string
          data_evento: string
          descricao?: string | null
          hora_evento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string | null
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_criacao?: string
          data_evento?: string
          descricao?: string | null
          hora_evento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      fiados: {
        Row: {
          cliente_id: string
          created_at: string
          data_vencimento: string | null
          id: string
          pedido_id: string | null
          updated_at: string
          valor_pago: number
          valor_pendente: number
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_vencimento?: string | null
          id?: string
          pedido_id?: string | null
          updated_at?: string
          valor_pago?: number
          valor_pendente?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_vencimento?: string | null
          id?: string
          pedido_id?: string | null
          updated_at?: string
          valor_pago?: number
          valor_pendente?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fiados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiados_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido: {
        Row: {
          created_at: string
          custo_unitario: number
          id: string
          lucro_item: number
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
        }
        Insert: {
          created_at?: string
          custo_unitario?: number
          id?: string
          lucro_item?: number
          pedido_id: string
          preco_unitario?: number
          produto_id: string
          quantidade?: number
        }
        Update: {
          created_at?: string
          custo_unitario?: number
          id?: string
          lucro_item?: number
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos_fiado: {
        Row: {
          created_at: string
          data_pagamento: string
          fiado_id: string
          id: string
          valor_pagamento: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string
          fiado_id: string
          id?: string
          valor_pagamento?: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          fiado_id?: string
          id?: string
          valor_pagamento?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_fiado_fiado_id_fkey"
            columns: ["fiado_id"]
            isOneToOne: false
            referencedRelation: "fiados"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string
          created_at: string
          data_pedido: string
          id: string
          status: string
          updated_at: string
          valor_lucro: number
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_pedido?: string
          id?: string
          status?: string
          updated_at?: string
          valor_lucro?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_pedido?: string
          id?: string
          status?: string
          updated_at?: string
          valor_lucro?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string
          custo_producao: number
          estoque_atual: number
          estoque_minimo: number
          id: string
          margem_lucro: number
          nome: string
          percentual_lucro: number
          preco_sugerido: number
          total_faturado: number
          total_vendido: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo_producao?: number
          estoque_atual?: number
          estoque_minimo?: number
          id?: string
          margem_lucro?: number
          nome: string
          percentual_lucro?: number
          preco_sugerido?: number
          total_faturado?: number
          total_vendido?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo_producao?: number
          estoque_atual?: number
          estoque_minimo?: number
          id?: string
          margem_lucro?: number
          nome?: string
          percentual_lucro?: number
          preco_sugerido?: number
          total_faturado?: number
          total_vendido?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
