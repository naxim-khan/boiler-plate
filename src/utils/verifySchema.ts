import prisma from '../PrismaClient';

async function verifyUserModel() {
  try {
    console.log('🔍 Checking User model structure...');
    
    // Try to create a test user to verify schema
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ User model verified successfully!');
    console.log('Created test user:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
      hasPassword: !!testUser.password,
    });

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    console.log('🧹 Test user cleaned up');
    
  } catch (error: any) {
    console.error('❌ User model verification failed:');
    console.error(error.message);
    
    if (error.code === 'P2000') {
      console.log('💡 Hint: Check if password field length is sufficient');
    } else if (error.code === 'P2003') {
      console.log('💡 Hint: Check foreign key constraints');
    } else if (error.code === 'P2010') {
      console.log('💡 Hint: Raw query failed - check database connection');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserModel();