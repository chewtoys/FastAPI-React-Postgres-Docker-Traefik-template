import { users } from '../data/users'
import adminPo from '../pages/admin.po'
import profilePo from '../pages/profile.po'

// afterAll(async () => {
//   page.close()
// })

describe('Test admin panel', () => {
  beforeAll(async () => {
    await profilePo.go()
    await profilePo.autoLogout()
    await profilePo.login('admin')
    await adminPo.go()
  })

  beforeEach(async () => {
    await adminPo.waitUntilHTMLRendered(page, 25)
  })

  test('verifying a user', async () => {
    // await page.click("[data-test-subj='user-update-form']")
    await adminPo.openUnverifiedUsersAccordion()
    await adminPo.selectFromUnverifiedUsersTable(users['toBeVerified'].email)
    await adminPo.waitUntilHTMLRendered(page, 100) // button will be rendered
    await adminPo.clickVerifyUsersButton()
  })

  test('resetting a user`s password manually', async () => {
    // await page.click("[data-test-subj='user-update-form']")
    await adminPo.openPasswordResetAccordion()
    await adminPo.selectFromPasswordResetTable(users['verified'].email)
    // button will be enabled
    await adminPo.waitUntilHTMLRendered(page, 100)
    await adminPo.clickPasswordResetButton()

    const trigger = async () => await adminPo.confirmModal()
    const newPassword = await adminPo.interceptPasswordReset(trigger, 'verified')
    await page.waitForNetworkIdle()
    expect(newPassword).not.toBe('')
    expect(users['verified'].password).toBe(newPassword)
  })

  test('accepting a user password reset request', async () => {
    await adminPo.openPasswordResetRequestsAccordion()
    // only passwordResetTestUser[*] are in the table
    const trigger = async () =>
      await adminPo.clickResetRequestsTableAction(users['passwordResetTestUser2'].email, 'reset')
    const newPassword = await adminPo.interceptPasswordReset(trigger, 'passwordResetTestUser2')
    await page.waitForNetworkIdle()
    expect(newPassword).not.toBe('')
    expect(users['passwordResetTestUser2'].password).toBe(newPassword)
  })

  test('declining a user password reset request', async () => {
    await adminPo.clickResetRequestsTableAction(users['passwordResetTestUser'].email, 'delete')
  })
})

describe('Test verification and access to admin panel', () => {
  test('accessing our profile now that we are verified', async () => {
    await profilePo.autoLogout()
    await page.waitForNetworkIdle()
    await profilePo.login('toBeVerified')
    const calloutErrors = (await profilePo.getFormCalloutErrors()).toString()
    expect(calloutErrors).not.toEqual(expect.stringMatching(/Current user is not verified/i))
  })

  it('should not let us see admin panel if we are not a superuser', async () => {
    await adminPo.go()
    await adminPo.getElementTextBySelector('body').then((text) => {
      expect(text).toEqual(expect.stringMatching(/You are not authorized/i))
    })
  })
})
