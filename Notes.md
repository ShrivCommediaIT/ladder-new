


















<DropdownMenuContent className="w-52 mt-2" align="end">
          <DropdownMenuLabel className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
            <UserCircle2 className="w-4 h-4" />
            {user?.name || "Guest"}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {user?.user_type === "admin" && (
            <>
              <DropdownMenuItem
                onClick={handleAdminClick}
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Shield className="mr-2 h-4 w-4 text-blue-600" />
                Admin Panel
              </DropdownMenuItem>

              {/* ✅ Login Player (only if ladderId exists) */}
              {getEncodedLadderId() && (
                <Link
                  href={`/login-user?id=${getEncodedLadderId()}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 px-2 py-1"
                >
                  <LogIn className="mr-2 h-4 w-4 text-purple-600" />
                  Login Player
                </Link>
              )}

              {/* ✅ Register Player (only if ladderId exists) */}
              {getEncodedLadderId() && (
                <Link
                  href={`/register-user?id=${getEncodedLadderId()}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30 px-2 py-1"
                >
                  <UserPlus className="mr-2 h-4 w-4 text-green-600" />
                  Register Player
                </Link>
              )}
            </>
          )}

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>












  <!-- Idea for rules removeable components  -->

     {idx === rulesList.length - 1 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            {/* Secondary Action: Ideas for Rules (Indigo/Blue Accent) */}
                            <Button className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg w-full sm:w-auto">
                              Ideas For Rules
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] w-full sm:max-w-3xl md:max-w-4xl overflow-y-auto px-4 bg-gray-900 border-gray-700 text-gray-100">
                            <DialogHeader>
                              <DialogTitle className="text-lg sm:text-xl text-amber-400 font-bold">
                                RULES FOR LADDER
                              </DialogTitle>
                            </DialogHeader>
                            <div>
                              <RulesForLadder />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}