admin = Admin.find_or_create_by(first_name: 'admin', last_name: 'admin', email: 'admin@mail.ru')
admin.password = 'admin'
admin.save

10.times do |i|
  u = [Manager, Developer].sample.new
  u.email = "email#{i}@mail.gen"
  u.first_name = "FN#{i}"
  u.last_name = "LN#{i}"
  u.password = "#{i}"
  u.save
end

states = ['new_task', 'in_development', 'in_qa', 'in_code_review', 'ready_for_release', 'released', 'archived']
states.each do |state|
  12.times do |i|
    Task.create!(name: "Test task #{i}", description: "This is a test task #{i} with state #{state}", author_id: User.find_by(type: "Manager").id, assignee_id: User.find_by(type: "Developer").id, state: state )
  end
end
