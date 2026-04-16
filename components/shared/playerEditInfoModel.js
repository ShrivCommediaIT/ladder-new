import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PlayerEditInfoModel = ({isDialogOpen, dialogMessage, setIsDialogOpen}) => {
    return (
        <>      
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md w-full">
                <DialogHeader>
                    <DialogTitle>Notice</DialogTitle>
                </DialogHeader>
                <p className="py-2 text-gray-800">{dialogMessage}</p>
                <DialogFooter>
                    <Button onClick={() => setIsDialogOpen(false)}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        </>
    )
}

export default PlayerEditInfoModel