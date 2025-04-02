import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Iniciando a criação do usuário administrador...');
    
    // Verificar se já existe um usuário com o email
    const existingUser = await prisma.user.findUnique({
      where: { email: 'laf@itlaf.com.br' }
    });

    if (existingUser) {
      console.log('Um usuário com o email laf@itlaf.com.br já existe.');
      return;
    }

    // Dados do administrador
    const adminData = {
      name: 'Administrador',
      email: 'laf@itlaf.com.br',
      password: await bcrypt.hash('123456', 10),
      role: 'ADMIN'
    };

    // Criar o usuário
    const user = await prisma.user.create({
      data: adminData
    });

    console.log('Usuário administrador criado com sucesso:');
    console.log('ID:', user.id);
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
    console.log('Função:', user.role);
    console.log('\nUtilize as seguintes credenciais para fazer login:');
    console.log('Email: laf@itlaf.com.br');
    console.log('Senha: 123456');
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
createAdmin(); 