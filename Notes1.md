user name for active 
chhotu12345
password = 111





<!-- admin upload ladder type with excel -->

     {/* RIGHT SIDE CREATE PANEL */}
          <div className="lg:col-span-2 bg-white/5 border max-h-[500px] border-white/10 backdrop-blur-xl p-4 sm:p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
      <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Create a Solution
      </h3>

      <Popover open={createOpen} onOpenChange={setCreateOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={() => setCreateOpen(!createOpen)}
            className="cursor-pointer underline text-cyan-300"
          >
            {createOpen ? "Hide" : "Show"}
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="center"
          className="w-[90vw] sm:w-xl bg-gray-300 border-slate-700 text-slate-900 px-2 py-4 rounded-lg shadow-2xl z-50 backdrop-blur-md"
        >
          <AdminHideShowInfo />
        </PopoverContent>
      </Popover>
    </div>

            <div className="space-y-4">
              {/* LADDER NAME */}
              <div>
                <Label className="text-md text-white">
                  Name :{" "}
                  <span className="text-xs text-gray-300">
                    Example: Hockey - Under 16s Challenge
                  </span>
                </Label>
                <Input
                  value={ladderName}
                  onChange={(e) => setLadderName(e.target.value)}
                  className="mt-1 h-11 rounded-xl bg-white/10 border-white/10 text-white"
                  placeholder="Enter - Sport Then Title of Solution"
                />
              </div>

              {/* TYPE SELECT */}
              <div>
                <Label className="text-md text-white">Choose Type : </Label>
                <select
                  value={ladderType}
                  onChange={(e) => setLadderType(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl bg-white/10 border border-white/10 px-3 text-white"
                >
                  <option className="bg-black" value="winlose">
                    Win / Lose Ladder
                  </option>
                  <option className="bg-black" value="best3">
                    Best of 3 Ladder
                  </option>
                  <option className="bg-black" value="best5">
                    Best of 5 Ladder
                  </option>
                  <option className="bg-black" value="minileague">
                    MiniLeagues
                  </option>
                  <option className="bg-black" value="skill">
                    Skills/Performance Leaderboards
                  </option>
                  <option className="bg-black" value="roster">
                    Roster
                  </option>
                </select>
              </div>

              {/* CSV UPLOAD */}
              <div>
                <Label className="text-md text-white">Players CSV</Label>
                <label className="group flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
                  <div className="pointer-events-none flex flex-col items-center gap-2">
                    <UploadCloud className="w-6 h-6 text-cyan-300" />
                    <p className="text-xs text-white/70">Click or drag CSV</p>
                  </div>

                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>

                {csvFile && (
                  <div className="flex justify-between mt-2 bg-black/30 border border-white/10 px-3 py-2 rounded-xl">
                    <span className="text-[11px] text-cyan-300 truncate">
                      {csvFile.name}
                    </span>
                    <span className="text-[10px] text-green-400 font-semibold">
                      Ready
                    </span>
                  </div>
                )}
              </div>

              {/* BUTTON */}
              <Button
                onClick={handleCreateLadder}
                disabled={!ladderName || !csvFile || loading}
                className="w-full h-12 rounded-2xl text-base font-bold bg-gray-800 border-t border-b border-cyan-500 shadow-xl active:scale-95"
              >
                {loading ? "Creating..." : "Create Solution"}
              </Button>
            </div>

            {/* <div className="mt-12 flex items-center rounded-md shadow justify-center bg-slate-900">
              <GenerateAccessCodes />
            </div> */}
          </div>