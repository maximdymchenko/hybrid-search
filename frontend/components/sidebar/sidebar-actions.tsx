'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { ServerActionResult, type Search } from '@/lib/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { LoaderCircle, Trash2 } from 'lucide-react';

interface SidebarActionsProps {
    search: Search;
    removeSearch: (args: {
        id: string;
        path: string;
    }) => ServerActionResult<void>;
}

export function SidebarActions({
    search: search,
    removeSearch: removeSearch,
}: SidebarActionsProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [isRemovePending, startRemoveTransition] = React.useTransition();
    return (
        <>
            <div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-7 p-2 hover:bg-background"
                            disabled={isRemovePending}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete It</TooltipContent>
                </Tooltip>
            </div>
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your search message and
                            remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemovePending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isRemovePending}
                            onClick={(event) => {
                                event.preventDefault();
                                // @ts-ignore
                                startRemoveTransition(async () => {
                                    const result = await removeSearch({
                                        id: search.id,
                                        path: `/search/${search.id}`,
                                    });

                                    if (result && 'error' in result) {
                                        toast.error(result.error);
                                        return;
                                    }

                                    setDeleteDialogOpen(false);
                                    router.refresh();
                                    router.push('/');
                                    toast.success('Search deleted');
                                });
                            }}
                        >
                            {isRemovePending && (
                                <LoaderCircle className="mr-2 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}