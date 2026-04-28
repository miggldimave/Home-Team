-- Allow users to delete their own task log entries
create policy "Members can delete their own task logs"
  on task_logs for delete
  using (household_id = get_my_household_id() and profile_id = auth.uid());
