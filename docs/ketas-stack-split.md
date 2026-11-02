# Stack quantity dialog

Enable **Split stack with Ctrl-click** under **Settings > Interface > Inventory, talk & shops**. It defaults off. In the enhanced inventory or Buy/Sell counter, Ctrl+left-click a stack, choose a quantity with the number field, slider or plus/minus buttons, then confirm. Escape or Cancel leaves all items unchanged. The default quantity is half the current stack, capped by the existing transfer rules.

The dialog uses native frame styles and existing capacity, ownership, quest-item, transaction and shop acceptance checks. It handles ordinary containers, materials bags and accessible wagons through the inventory's current destination. It stages quantities for purchase or sale; it never confirms a transaction itself. Single items and other modifier combinations do not open it. Classic inventory retains its existing quantity popup. This does not add equal-part stack creation, bulk transfers, wagon access changes, shop automation or trash filtering.

The owner closes the modal on unmount. Confirmation rechecks source membership and capacity, and a detached button cannot submit twice. The ordinary container commit callback is not used when the active destination is the player's wagon or materials bag.

Validation: `node --test test/ui/stackSplitDialog.test.js test/ui/enhanced/disc25f_stack_split.test.js` and `node tools/stackSplitProbe.mjs`. The browser probe uses synthetic items and an isolated headless profile. No live inventory or account is used.
