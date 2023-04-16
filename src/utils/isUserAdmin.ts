export const isUserAdmin = async (ctx: any) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const chatType = ctx.chat.type;

  // Если это приватный чат, то считаем пользователя администратором
  if (chatType === 'private') {
    return true;
  }

  try {
    const admins = await ctx.getChatAdministrators(chatId);
    const adminIds: string[] = admins.map((admin) => admin.user.id);

    return adminIds.includes(userId);
  } catch (error) {
    console.error('Error while checking admin status:', error);
    return false;
  }
}